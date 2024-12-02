import { createTransport } from 'nodemailer';
import { emailConfig, getBranchCredentials } from '../config/emailConfig.js';

export class EmailTransport {
  constructor() {
    this.transporters = new Map();
  }

  getTransporter(branchId) {
    if (!this.transporters.has(branchId)) {
      const { email, password } = getBranchCredentials(branchId);
      
      const transporter = createTransport({
        ...emailConfig,
        auth: { user: email, pass: password }
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

  async sendMail(branchId, mailOptions) {
    await this.verifyTransporter(branchId);
    const transporter = this.getTransporter(branchId);
    
    try {
      const result = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
}

export const emailTransport = new EmailTransport();