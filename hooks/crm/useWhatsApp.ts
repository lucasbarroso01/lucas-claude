'use client'

import { useState } from 'react'

export function useWhatsApp() {
  const [sending, setSending] = useState(false)

  const sendMessage = async (phone: string, message: string): Promise<boolean> => {
    setSending(true)
    try {
      const cleanPhone = phone.replace(/\D/g, '')
      const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
      return true
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      return false
    } finally {
      setSending(false)
    }
  }

  const sendBulkMessages = async (phones: string[], message: string) => {
    for (const phone of phones) {
      await sendMessage(phone, message)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  return { sendMessage, sendBulkMessages, sending }
}
