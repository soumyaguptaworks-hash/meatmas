import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST');

    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.configService.get<number>('MAIL_PORT') ?? 587,
        secure: false,
        auth: {
          user: this.configService.get<string>('MAIL_USER'),
          pass: this.configService.get<string>('MAIL_PASS'),
        },
      });
    }
  }

  async sendOtp(to: string, name: string, otp: string): Promise<void> {
    if (!this.transporter) {
      // Dev fallback: log OTP instead of sending email
      this.logger.warn(`[DEV] OTP for ${to} → ${otp}`);
      return;
    }

    await this.transporter.sendMail({
      from: `"MeatMaster ERP" <${this.configService.get('MAIL_FROM')}>`,
      to,
      subject: 'Your MeatMaster Login OTP',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
          <h2>Hello ${name},</h2>
          <p>Your one-time password for <strong>MeatMaster ERP</strong> is:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px;
                      color: #b71c1c; padding: 16px 0;">${otp}</div>
          <p>This OTP expires in <strong>10 minutes</strong>.</p>
          <p style="color: #888; font-size: 12px;">
            If you did not attempt to log in, please contact your administrator.
          </p>
        </div>
      `,
    });
  }
}
