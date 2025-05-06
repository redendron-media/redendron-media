import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const ADMIN_EMAIL = 'team@redendron.com'
const TEMPLATE_ID_ADMIN = 15  
const TEMPLATE_ID_USER = 16
const CONTACT_LIST_ID = 14      // Replace with your Brevo contact list ID

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    const brevoPayload = (templateId: number, toEmail: string) => ({
      templateId,
      to: [{ email: toEmail }],
      params: {
        ...formData,
        referral: Array.isArray(formData.referral)
          ? formData.referral.join(', ')
          : formData.referral,
      },
    })

    const headers = {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY!, 
      }
      

    // 1. Send to Admin
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      brevoPayload(TEMPLATE_ID_ADMIN, ADMIN_EMAIL),
      { headers }
    )

    // 2. Send to User
    if (formData.email) {
      await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        brevoPayload(TEMPLATE_ID_USER, formData.email),
        { headers }
      )

      // 3. Create or Update Brevo Contact
      await axios.post(
        'https://api.brevo.com/v3/contacts',
        {
          email: formData.email,
          attributes: {
            NAME: formData.name || '',
            EMAIL: formData.email || '',
            PHONE: formData.phone ? `+91${formData.phone}` : '',
            SOURCE: 'Quote Form',
          },
          listIds: [CONTACT_LIST_ID],
          updateEnabled: true,
        },
        { headers }
      )}
      

    return NextResponse.json({ message: 'Quote submitted and emails sent' })
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Brevo API error:', error.response.data)
      return NextResponse.json(
        { error: 'Email sending failed', details: error.response.data },
        { status: 500 }
      )
    }

    console.error('Server error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
