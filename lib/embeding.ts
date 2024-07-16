import { HfInference, FeatureExtractionOutput } from '@huggingface/inference';
const API_KEY = process.env.HUGGINGFACE_API_KEY;
if (!API_KEY) {
  throw new Error('HUGGINGFACE_API_KEY is not set in environment variables');
}

const hf: HfInference = new HfInference(API_KEY);

export async function embedText(text: string): Promise<number[]> {
  try {
    const result: FeatureExtractionOutput = await hf.featureExtraction({
      model: 'BAAI/bge-m3',
      inputs: text
    });

    if (Array.isArray(result) && result.every(item => typeof item === 'number')) {
      return result as number[];
    } else if (Array.isArray(result) && result.every(Array.isArray)) {
      return (result as number[][])[0];
    } else if (typeof result === 'number') {
      return [result];
    } else {
      throw new Error('Unexpected response format from the API');
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in embedText:', error.message);
      throw new Error(`Hugging Face API error: ${error.message}`);
    } else {
      console.error('Unknown error in embedText:', error);
      throw new Error('An unknown error occurred');
    }
  }
}

const exportObject = { embedText };
export default exportObject;