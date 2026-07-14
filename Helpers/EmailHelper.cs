using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace AuthDemo.Helpers;

public class EmailHelper
{
    private readonly IConfiguration _config;

    public EmailHelper(
        IConfiguration config)
    {
        _config = config;
    }

    // =====================================================
    // SEND OTP EMAIL
    // =====================================================

    public async Task SendEmail(
        string toEmail,
        string otp)
    {
        try
        {
            var email =
                new MimeMessage();

            email.From.Add(
                new MailboxAddress(
                    "Clinic Management System",
                    _config["EmailSettings:Email"]
                )
            );

            email.To.Add(
                MailboxAddress.Parse(
                    toEmail
                )
            );

            email.Subject =
                "OTP Verification";

            email.Body =
                new TextPart("html")
                {
                    Text =
                        $@"
                        <h2>OTP Verification</h2>

                        <p>Your OTP is:</p>

                        <h1>{otp}</h1>

                        <p>
                        OTP expires in 10 minutes.
                        </p>
                        "
                };

            using var smtp =
                new SmtpClient();

            await smtp.ConnectAsync(
                _config["EmailSettings:Host"],
                int.Parse(
                    _config["EmailSettings:Port"]
                ),
                SecureSocketOptions.StartTls
            );

            await smtp.AuthenticateAsync(
                _config["EmailSettings:Email"],
                _config["EmailSettings:Password"]
            );

            await smtp.SendAsync(email);

            await smtp.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            throw new Exception(
                "Email sending failed: " +
                ex.Message
            );
        }
    }

    // =====================================================
    // SEND ADMIN CREDENTIALS
    // =====================================================

    public async Task SendAdminCredentials(
        string toEmail,
        string tempPassword)
    {
        try
        {
            var email =
                new MimeMessage();

            email.From.Add(
                new MailboxAddress(
                    "Clinic Management System",
                    _config["EmailSettings:Email"]
                )
            );

            email.To.Add(
                MailboxAddress.Parse(
                    toEmail
                )
            );

            email.Subject =
                "Welcome to Clinic Management System";

            email.Body =
                new TextPart("html")
                {
                    Text =
                        $@"
                        <h2>Welcome to Clinic Management System</h2>

                        <p>
                        Your Admin account has been created successfully.
                        </p>

                        <p>
                        <b>Email:</b>
                        {toEmail}
                        </p>

                        <p>
                        <b>Temporary Password:</b>
                        {tempPassword}
                        </p>

                        <p>
                        Please login and change your password immediately.
                        </p>

                        <br/>

                        <p>
                        Regards,<br/>
                        Clinic Management Team
                        </p>
                        "
                };

            using var smtp =
                new SmtpClient();

            await smtp.ConnectAsync(
                _config["EmailSettings:Host"],
                int.Parse(
                    _config["EmailSettings:Port"]
                ),
                SecureSocketOptions.StartTls
            );

            await smtp.AuthenticateAsync(
                _config["EmailSettings:Email"],
                _config["EmailSettings:Password"]
            );

            await smtp.SendAsync(email);

            await smtp.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            throw new Exception(
                "Email sending failed: " +
                ex.Message
            );
        }
    }
}