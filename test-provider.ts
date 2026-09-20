import { createAIProvider } from './src/lib/ai/provider';

async function test() {
  const provider = createAIProvider();
  console.log('Provider type:', provider.constructor.name);
  
  if (provider.constructor.name === 'MockProvider') {
    console.log('Using MockProvider');
    const result = await provider.generateCompletion('test prompt');
    console.log('Mock result:', result);
  } else {
    console.log('Using OpenAIProvider');
  }
}

test().catch(console.error);
