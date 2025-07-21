import axios, { type AxiosResponse } from 'axios';
import { TIMEOUTS } from './config';

export interface TranslationRequest {
  text: string;
  domain: string;
}

export interface TranslationResponse {
  gloss: string;
}

export class VLibrasTranslator {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Traduz um texto para glosa (linguagem intermediária para Libras)
   */
  async translate(text: string, domain: string = ''): Promise<string> {
    if (!text || text.trim().length === 0) {
      throw new Error('Texto não pode estar vazio');
    }

    const timeout = this.calculateTimeout(text);
    
    try {
      const response: AxiosResponse<string> = await axios.post(
        this.endpoint,
        {
          text: text.trim(),
          domain: domain || window?.location?.hostname || 'localhost',
        } as TranslationRequest,
        {
          timeout,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data) {
        throw new Error('Resposta vazia do servidor de tradução');
      }

      return response.data;
    } catch (error: any) {
      if (error?.code === 'ECONNABORTED') {
        throw new Error('timeout_error');
      }
      if (error?.response?.status === 400) {
        throw new Error('Texto inválido para tradução');
      }
      if (error?.response?.status >= 500) {
        throw new Error('Erro interno do servidor de tradução');
      }
      
      throw error instanceof Error ? error : new Error('Erro desconhecido na tradução');
    }
  }

  /**
   * Calcula o timeout baseado no tamanho do texto
   */
  private calculateTimeout(text: string): number {
    const wordCount = text.split(/\s+/).length;
    let timeout = TIMEOUTS.translation;

    // Adiciona tempo extra para textos maiores
    if (wordCount > 50) {
      timeout += Math.floor(wordCount * TIMEOUTS.translationPerWord / 10);
    }

    // Garante que não ultrapasse o máximo
    return Math.min(timeout, TIMEOUTS.maxTranslationTimeout);
  }

  /**
   * Valida se o endpoint está acessível
   */
  async validateEndpoint(): Promise<boolean> {
    try {
      await axios.get(this.endpoint, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
