import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import 'dotenv/config';
import { queryGreptile } from '../../../lib/queryGreptile';
import { dbConnect } from '@/lib/mongodb';
import Session from '../../../models/session';
import { queryPineconeForRelevantHistory, upsertToPinecone } from '@/lib/pineconecalls';

interface FeatureExtractionRequest {
  sessionId: string;
  featureTitle: string;
  featureDescription: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: FeatureExtractionRequest = await req.json();
    const { sessionId, featureTitle, featureDescription } = body;

    await dbConnect();
    const session = await Session.findById(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const { inspirationRepo, userRepo, inspirationBranch, userBranch } = session;

    const extractionQuery = `
Task: Extract and explain the code for the feature titled "${featureTitle}"

Description: ${featureDescription}

Please provide the following in your response:

1. Extracted Code:
   - Provide the full, relevant code snippets for the feature.
   - Include any necessary imports, function definitions, and related components.

2. Detailed Explanation:
   - Break down the code into logical sections.
   - Explain the purpose and functionality of each section.
   - Describe any key algorithms or data structures used.

3. Implementation Steps:
   - Provide a step-by-step guide on how to implement this feature in another codebase.
   - Include any necessary setup or configuration steps.
   - Mention any dependencies or prerequisites.

4. Best Practices:
   - Highlight any best practices or design patterns used in the code.
   - Suggest any potential optimizations or improvements.

5. Potential Challenges:
   - Identify any potential challenges or considerations when implementing this feature in a different codebase.
   - Suggest solutions or workarounds for these challenges.

6. Testing Considerations:
   - Provide guidance on how to test this feature effectively.
   - Suggest any key test cases or scenarios to consider.

Please ensure the response is comprehensive, clear, and follows a logical structure for easy understanding and implementation.;
`;
    
    const extractedFeature = await queryGreptile(inspirationRepo, extractionQuery, inspirationBranch);
    const compatibilityQuery = `
    Task: Analyze the compatibility of the extracted feature with the codebase in ${userRepo}
    
    Extracted Feature:
    ${extractedFeature.message}
    
    Please provide a detailed compatibility analysis including:
    
    1. Compatibility Score:
       - Provide a score from 0 to 10, where 0 is completely incompatible and 10 is perfectly compatible.
       - Explain the reasoning behind the score.
    
    2. Architecture Alignment:
       - Assess how well the feature aligns with the overall architecture .
       - Identify any architectural changes needed to accommodate the feature.
    
    3. Dependency Analysis:
       - List any new dependencies that would need to be added.
       - Identify any potential conflicts with existing dependencies.
    
    4. Code Style and Conventions:
       - Compare the code style of the feature with ${userRepo}'s conventions.
       - Suggest any necessary style adjustments.
    
    5. Performance Implications:
       - Analyze any potential performance impacts on ${userRepo}.
       - Suggest optimizations if necessary.
    
    6. Security Considerations:
       - Identify any security implications of integrating this feature.
       - Suggest security enhancements if needed.
    
    7. Necessary Modifications:
       - Provide a detailed list of modifications needed to integrate the feature.
       - Explain the reasoning behind each modification.
    
    8. Integration Complexity:
       - Assess the overall complexity of integrating this feature.
       - Estimate the effort required for integration (e.g., low, medium, high).
    
    9. Testing Requirements:
       - Suggest necessary updates to the test suite.
       - Identify any new test cases that should be added.
    
    10. Potential Risks:
        - List any potential risks or challenges in integrating this feature.
        - Suggest mitigation strategies for each risk.
    
    Please ensure the analysis is thorough, clear, and provides actionable insights for integration.`;
    
    
    // const compatibilityQuery = `Analyze the compatibility of the following code with the codebase in ${userRepo}:\n\n${extractedFeature.message}\n\nProvide a compatibility score from 0 to 10 and explain any potential issues or necessary modifications.`;
    const compatibilityAnalysis = await queryGreptile(userRepo, compatibilityQuery, userBranch);

    const implementationQuery = `
    Task: Provide three different approaches to implement the feature titled "${featureTitle}"
    
    Feature Description: ${featureDescription}
    
    An ideal codebase simply involves analyzing the code to better understand what I want for my own codebase.:
    ${extractedFeature.message}
    Feature and Compatibility Analysis:
    ${compatibilityAnalysis.message}
    
    For each implementation approach, please provide:
    
    1. High-Level Overview:
   - Briefly describe the approach and its key characteristics.

    2. Detailed Implementation Steps:
   - Provide a step-by-step guide for implementing this approach.
   - Include code snippets or pseudocode where appropriate.  
  
    3. Resource Requirements:
       - Estimate the time and effort required for this implementation.
       - List any additional resources or expertise needed, specific to "${featureTitle}".
    
    4. Impact on Existing Codebase:
       - Describe how this approach would affect the existing codebase.
       - Identify any parts of the codebase that would need significant changes to accommodate "${featureTitle}".
    
    5. Scalability and Future-Proofing:
       - Assess how well this approach would scale as the application grows.
       - Consider how flexible this approach is for future modifications or enhancements to "${featureTitle}".
    
    6. Performance Considerations:
       - Analyze the performance implications of this approach.
       - Suggest any optimizations specific to this implementation of "${featureTitle}".
    
    7. Best Practices and Design Patterns:
        - Identify any best practices or design patterns utilized in this approach.
        - Explain why they are appropriate for this implementation of "${featureTitle}".
    
    Please ensure that the three approaches are significantly different from each other and offer unique trade-offs. Provide a clear, comprehensive analysis for each approach to aid in decision-making. Each approach should directly address the implementation of "${featureTitle}" as described in the feature description.`;
    
    
    // const implementationQuery = `Provide three different ways to implement the following feature from ideal codebase:\n\n${compatibilityAnalysis.message}\n\nFor each implementation, provide a brief explanation of its advantages and disadvantages.`;
     const implementationSuggestions = await queryGreptile(userRepo, implementationQuery, userBranch);

    session.extractedFeature = extractedFeature.message;
    session.compatibilityAnalysis = compatibilityAnalysis.message;
    session.implementationSuggestions = implementationSuggestions.message;
    await session.save();

    const combinedMessage = `${extractedFeature.message} ${implementationSuggestions.message}`;
    await upsertToPinecone(sessionId, combinedMessage,userRepo);
    await upsertToPinecone(sessionId, extractedFeature.message,inspirationRepo);



    return NextResponse.json({
      extractedFeature,
      compatibilityAnalysis,
      implementationSuggestions
    });

  } catch (error) {
    console.error('Error in feature extraction process:', error);

    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      const errorMessage = error.response?.data?.message || error.message;
      return NextResponse.json({ error: `API error: ${errorMessage}` }, { status: statusCode });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}