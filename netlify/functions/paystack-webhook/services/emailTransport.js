import { createTransport } from 'nodemailer';
import { branchConfig } from '../../config/branchConfig.js';

export class EmailTransporter {
  constructor() {
    this.transporters = new Map();
  }

  getTransporter(branchId) {
    if (!this.transporters.has(branchId)) {
      const email = branchConfig[branchId].email;
      const password = branchConfig[branchId].password;

      if (!email || !password) {
        throw new Error(`Missing email configuration for branch ${branchId}`);
      }

      const transporter = createTransport({
        service: 'Gmail',
        auth: { user: email, pass: password },
        debug: true,
        logger: true
      });

      this.transporters.set(branchId, transporter);
    }

    return this.transporters.get(branchId);
  }

  async verifyTransporter(branchId) {
    const transporter = this.getTransporter(branchId);
    try {
      await transporter.verify();
      console.log(`Email transporter verified for branch ${branchId}`);
      return true;
    } catch (error) {
      console.error(`Email transporter verification failed for branch ${branchId}:`, error);
      throw error;
    }
  }

  async sendEmail(branchId, options) {
    await this.verifyTransporter(branchId);
    const transporter = this.getTransporter(branchId);

    try {
      const result = await transporter.sendMail(options);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
}

export const emailTransporter = new EmailTransporter();