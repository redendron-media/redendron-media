import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const ADMIN_EMAIL = 'team@redendron.com'
const TEMPLATE_ID_ADMIN = 17 
const CONTACT_LIST_ID = 14  

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstname, lastname, email, phone, message } = body

    const fullName = `${firstname} ${lastname}`

    const headers = {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY!,
    }

    // 1. Send admin notification email
    const emailPayload = {
      to: [{ email: ADMIN_EMAIL }],
      templateId: TEMPLATE_ID_ADMIN,
      params: {
        NAME: fullName,
        EMAIL: email,
        PHONE: phone,
        MESSAGE: message || '',
      },
    }

    await axios.post('https://api.brevo.com/v3/smtp/email', emailPayload, {
      headers,
    })

    // 2. Create/update Brevo contact
    await axios.post(
      'https://api.brevo.com/v3/contacts',
      {
        email,
        attributes: {
          NAME: fullName,
          EMAIL: email,
          PHONE: phone ? `+91${phone}` : '',
          SOURCE: 'Contact Form',
        },
        listIds: [CONTACT_LIST_ID],
        updateEnabled: true,
      },
      { headers }
    )

    return NextResponse.json({ message: 'Email sent & contact saved' })
  } catch (err: any) {
    console.error('Brevo API error:', err.response?.data || err)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}
