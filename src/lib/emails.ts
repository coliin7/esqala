import { getResend } from "./resend"

const FROM_EMAIL = "Cursos App <noreply@cursos.app>"

export async function sendEnrollmentEmail({
  to,
  studentName,
  courseName,
  courseUrl,
}: {
  to: string
  studentName: string
  courseName: string
  courseUrl: string
}) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Bienvenido a "${courseName}"`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #111; font-size: 24px;">¡Bienvenido, ${studentName}!</h1>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Tu compra de <strong>${courseName}</strong> fue confirmada.
            Ya podés acceder al curso y empezar a aprender.
          </p>
          <a href="${courseUrl}"
             style="display: inline-block; background: #111; color: #fff; padding: 12px 24px;
                    border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
            Ir al curso
          </a>
          <p style="color: #999; font-size: 14px; margin-top: 32px;">
            Si tenés alguna duda, respondé este email.
          </p>
        </div>
      `,
    })
  } catch (error) {
    console.error("Error sending enrollment email:", error)
  }
}

export async function sendSaleNotificationEmail({
  to,
  creatorName,
  courseName,
  amount,
  studentEmail,
}: {
  to: string
  creatorName: string
  courseName: string
  amount: number
  studentEmail: string
}) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Nueva venta: ${courseName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #111; font-size: 24px;">¡Nueva venta, ${creatorName}!</h1>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            Alguien compró <strong>${courseName}</strong>.
          </p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr>
              <td style="padding: 8px 0; color: #999;">Alumno</td>
              <td style="padding: 8px 0; text-align: right;">${studentEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #999;">Monto</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600;">$${amount.toLocaleString("es-AR")} ARS</td>
            </tr>
          </table>
        </div>
      `,
    })
  } catch (error) {
    console.error("Error sending sale notification email:", error)
  }
}
