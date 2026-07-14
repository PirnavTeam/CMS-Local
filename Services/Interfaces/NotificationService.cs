using System.Net;
using System.Net.Mail;

namespace AuthDemo.Services;

public class NotificationService
{
    private readonly IConfiguration _config;

    public NotificationService(
        IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmail(
        string to,
        string subject,
        string body)
    {
        var smtp =
            new SmtpClient(
                _config["EmailSettings:Host"])
            {
                Port =
                    int.Parse(
                        _config["EmailSettings:Port"]),

                Credentials =
                    new NetworkCredential(
                        _config["EmailSettings:Email"],
                        _config["EmailSettings:Password"]),

                EnableSsl = true
            };

        var mail =
            new MailMessage(
                _config["EmailSettings:Email"],
                to,
                subject,
                body);

        await smtp.SendMailAsync(mail);
    }
}