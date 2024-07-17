# Code Mirrorer: AI-Powered Code Analysis and Feature Extraction Tool

## Overview

Code Mirrorer is an advanced code analysis and feature extraction tool that leverages AI and Large Language Models (LLMs) to help developers learn from and integrate features from ideal codebases into their own projects. This tool provides an interactive way to explore, understand, and adapt code while considering the specific context of the user's codebase.

## Technologies Used

- **Framework**: Next.js (React framework)
- **Language**: TypeScript
- **AI/LLM Tools**:
  - Greptile: Used for querying and analyzing code repositories
  - Pinecone: Vector database for storing and retrieving relevant code snippets and chat history
  - Hugging Face: LLM model (BAAI/bge-m3) for text embedding

## Key Features

1. **Repository Indexing**
   - Index two GitHub repositories: an "ideal" repository and the user's repository
   - Supports specifying different branches for each repository

2. **Feature Extraction**
   - Extract specific features from the ideal repository based on user input
   - Provide detailed explanations of how the extracted code works

3. **Compatibility Analysis**
   - Analyze the compatibility of extracted features with the user's codebase
   - Provide a compatibility score and explain potential issues or necessary modifications

4. **Implementation Suggestions**
   - Generate multiple implementation approaches for the extracted feature
   - Provide advantages and disadvantages for each suggested implementation

5. **Interactive Chat Interface**
   - Allow users to ask questions and seek clarifications about extracted features, compatibility, or implementations
   - Provide context-aware responses using both ideal and user repositories

6. **Persistent Sessions**
   - Maintain user sessions to allow returning to previous work

## How It Works

1. **Repository Submission**: Users submit links to two GitHub repositories - an ideal repo and their own repo.

2. **Indexing**: The system indexes both repositories, making their contents searchable and analyzable.

3. **Feature Extraction**: Users can request to extract a specific feature by providing a title and description. The system uses AI to locate and extract relevant code from the ideal repository.

4. **Compatibility Check**: The extracted feature is analyzed for compatibility with the user's repository. This includes a compatibility score and detailed explanation of potential issues.

5. **Implementation Suggestions**: The system generates multiple ways to implement the extracted feature in the user's codebase, complete with pros and cons for each approach.

6. **Interactive Chat**: Users can engage in a chat interface to ask questions, seek clarifications, or get more details about any aspect of the extracted feature or suggested implementations.

## Technical Details

- **Backend**: Next.js API routes handle server-side logic
- **Database**: MongoDB is used for storing session information and other persistent data
- **Vector Storage**: Pinecone is used for storing and querying vector representations of code snippets and chat history
- **Code Analysis**: Greptile is employed for in-depth code analysis and query processing
- **Text Embedding**: Hugging Face's BAAI/bge-m3 model is used to generate embeddings for storing text in the vector database


## Technical Impressiveness

Code Mirrorer showcases several technically impressive features:

1. **Intelligent Chat History Management**: 
   We implemented a sophisticated chat history system using Pinecone, a vector database. This allows for efficient storage and retrieval of context-relevant information, enhancing the AI's ability to provide coherent and contextually appropriate responses over extended conversations.

2. **Advanced Prompt Engineering**: 
   To improve the relevance and quality of AI-generated responses, we developed a series of carefully crafted prompts. These prompts are designed to guide the AI in providing appropriate answers while maintaining flexibility for a wide range of queries. This required multiple iterations and fine-tuning to balance specificity with generality.

3. **Cross-Repository Feature Extraction**: 
   The system's ability to extract features from one repository and analyze their compatibility with another repository presented unique challenges. We developed algorithms to not only identify relevant code sections but also to assess their fit within a different codebase context.

4. **Dynamic Code Analysis**: 
   Leveraging the Greptile API, we implemented real-time code analysis capabilities. This allows for on-the-fly assessment of code compatibility and generation of implementation suggestions, pushing the boundaries of what's possible with current code analysis tools.

5. **Scalable Architecture**: 
   The application is designed with scalability in mind, using Next.js for efficient server-side rendering and API routes. This architecture allows for handling multiple user sessions concurrently while maintaining performance.

While these features demonstrate the technical depth of Code Mirrorer, it's worth noting that the system is still in development. Some aspects, particularly the chat functionality and prompt engineering, are continually being refined. We've aimed to create a flexible system that can adapt to various use cases, but users should be aware that results may vary depending on the specific repositories and queries involved.


## AI Tools Used in Development

1. Claude & Chatgpt: Used for brainstorming ideas, troubleshooting, and refining prompts.

## Getting Started

Follow these steps to set up and run the project locally:

1. **Clone the repository**
- run :
 ```
 git clone https://github.com/kabir276/GreptileCodeMirrorer.git
 ```

2. **Set up environment variables**
- Copy the example environment file:
  ```
  cp .env.example .env
  ```
- Open the `.env` file and enter your API keys for the required services (Greptile, Pinecone, MongoDB etc.)

3. **Install dependencies**
- run this in root directory:
  ```
  npm install
  ```
4. **Run the development server**
   ```
    npm run dev
   ```
5. **Access the application**
Open your browser and navigate to `http://localhost:3000`

The application should now be running on your local machine. You can start using CodeCompare by submitting repository links and exploring its features.

Note: Ensure you have npm installed on your system before starting these steps.

