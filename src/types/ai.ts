export interface AiTutorMessage {
  id: string; role: 'user' | 'assistant'; content: string; timestamp: Date
}
export interface AiTutorRequest {
  message: string; context: string
}
export interface AiTutorResponse {
  response: string; context: string
}
