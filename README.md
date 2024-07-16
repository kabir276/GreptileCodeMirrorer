# Code Mirrorer: AI-Powered Code Analysis and Feature Extraction Tool

## Overview

Code Mirrorer is an advanced code analysis and feature extraction tool that leverages AI and Large Language Models (LLMs) to help developers learn from and integrate features from inspiration codebases into their own projects. This tool provides an interactive way to explore, understand, and adapt code while considering the specific context of the user's codebase.

## Technologies Used

- **Framework**: Next.js (React framework)
- **Language**: TypeScript
- **AI/LLM Tools**:
  - Greptile: Used for querying and analyzing code repositories
  - Pinecone: Vector database for storing and retrieving relevant code snippets and chat history
  - Hugging Face: LLM model (BAAI/bge-m3) for text embedding

## Key Features

1. **Repository Indexing**
   - Index two GitHub repositories: an "inspiration" repository and the user's repository
   - Supports specifying different branches for each repository

2. **Feature Extraction**
   - Extract specific features from the inspiration repository based on user input
   - Provide detailed explanations of how the extracted code works

3. **Compatibility Analysis**
   - Analyze the compatibility of extracted features with the user's codebase
   - Provide a compatibility score and explain potential issues or necessary modifications

4. **Implementation Suggestions**
   - Generate multiple implementation approaches for the extracted feature
   - Provide advantages and disadvantages for each suggested implementation

5. **Interactive Chat Interface**
   - Allow users to ask questions and seek clarifications about extracted features, compatibility, or implementations
   - Provide context-aware responses using both inspiration and user repositories

6. **Persistent Sessions**
   - Maintain user sessions to allow returning to previous work

## How It Works

1. **Repository Submission**: Users submit links to two GitHub repositories - an inspiration repo and their own repo.

2. **Indexing**: The system indexes both repositories, making their contents searchable and analyzable.

3. **Feature Extraction**: Users can request to extract a specific feature by providing a title and description. The system uses AI to locate and extract relevant code from the inspiration repository.

4. **Compatibility Check**: The extracted feature is analyzed for compatibility with the user's repository. This includes a compatibility score and detailed explanation of potential issues.

5. **Implementation Suggestions**: The system generates multiple ways to implement the extracted feature in the user's codebase, complete with pros and cons for each approach.

6. **Interactive Chat**: Users can engage in a chat interface to ask questions, seek clarifications, or get more details about any aspect of the extracted feature or suggested implementations.

## Technical Details

- **Backend**: Next.js API routes handle server-side logic
- **Database**: MongoDB is used for storing session information and other persistent data
- **Vector Storage**: Pinecone is used for storing and querying vector representations of code snippets and chat history
- **Code Analysis**: Greptile is employed for in-depth code analysis and query processing
- **Text Embedding**: Hugging Face's BAAI/bge-m3 model is used to generate embeddings for storing text in the vector database

## Getting Started

Follow these steps to set up and run the project locally:

1. **Clone the repository**
- run :
 ```
 git clone 
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


