import './fetch-polyfill.js'
import * as optionsJs from './options.js'
import OpenAI from 'openai'

export type Ids = {}

export class Bot {
  private client: OpenAI
  private options: optionsJs.Options

  constructor(options: optionsJs.Options) {
    this.options = options

    const apiKey = process.env.GROQ_API_KEY || process.env.INPUT_GROQ_API_KEY

    if (!apiKey) {
      throw new Error("GROQ_API_KEY is missing")
    }

    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.groq.com/openai/v1'
    })

    console.log("API KEY PRESENT:", !!apiKey)
  }

  chat = async (message: string, _ids?: any): Promise<[string, Ids]> => {
    try {
      if (!message) return ['', {}]

      console.log("🚀 CALLING GROQ...")

      const response = await this.client.chat.completions.create({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: this.options.system_message || 'You are a code reviewer'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.2
      })

      console.log("✅ FULL RESPONSE:", JSON.stringify(response, null, 2))

      const text = response?.choices?.[0]?.message?.content

      if (!text) {
        console.log("⚠️ EMPTY RESPONSE FROM GROQ")
        return ['', {}]
      }

      return [text, {}]

    } catch (e: any) {
        console.log("❌ GROQ FULL ERROR:", JSON.stringify(e, null, 2))
        throw e
      }
  }
}