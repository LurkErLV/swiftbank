import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AccountNumberGenerator {
  constructor(private prisma: PrismaService) {}

  /**
   * Generates a unique bank account number in SWIFT-style format
   * Format: SWB + 2-digit country code + 2-digit check digits + 16-digit account number
   * Example: SWB LV 47 BANK 0000 4351 9500 1
   */
  async generateUniqueAccountNumber(countryCode: string = 'LV'): Promise<string> {
    let isUnique = false;
    let accountNumber = ''; // Initialize the variable

    while (!isUnique) {
      // Generate the account number components
      const bankCode = 'BANK'; // 4-character bank identifier
      const branchCode = this.generateRandomDigits(4); // 4-digit branch code
      const accountBase = this.generateRandomDigits(10); // 10-digit account base
      const checkDigit = this.generateRandomDigits(1); // 1-digit check digit

      // Combine all parts
      const accountNumberPart = `${bankCode}${branchCode}${accountBase}${checkDigit}`;
      
      // Calculate check digits for the entire number
      const checkDigits = this.calculateCheckDigits(countryCode, accountNumberPart);

      // Format: SWBCC##AAAAAAAAAAAAAAAAAAA (without spaces)
      accountNumber = `SWB${countryCode}${checkDigits}${accountNumberPart}`;

      // Check if account number already exists
      const existing = await this.prisma.bankAccount.findUnique({
        where: { accountNumber },
      });

      isUnique = !existing;
    }

    return accountNumber;
  }

  /**
   * Generates a formatted account number with spaces for readability
   * Format: SWB LV 47 BANK 0000 4351 9500 1
   */
  formatAccountNumber(accountNumber: string): string {
    // Remove SWB prefix for formatting
    const withoutPrefix = accountNumber.substring(3);
    
    // Split into groups: CC ## AAAA AAAA AAAA AAAA A
    const countryCode = withoutPrefix.substring(0, 2);
    const checkDigits = withoutPrefix.substring(2, 4);
    const remaining = withoutPrefix.substring(4);

    // Split remaining into groups of 4
    const groups = remaining.match(/.{1,4}/g) || [];
    
    return `SWB ${countryCode} ${checkDigits} ${groups.join(' ')}`;
  }

  /**
   * Validates an account number format
   */
  validateAccountNumberFormat(accountNumber: string): boolean {
    // Remove spaces
    const cleaned = accountNumber.replace(/\s/g, '');
    
    // Check format: SWB + 2 letters + 2 digits + 19 alphanumeric characters
    const regex = /^SWB[A-Z]{2}\d{2}[A-Z0-9]{19}$/;
    
    if (!regex.test(cleaned)) {
      return false;
    }

    // Validate check digits
    const countryCode = cleaned.substring(3, 5);
    const checkDigits = cleaned.substring(5, 7);
    const accountPart = cleaned.substring(7);
    
    const calculatedCheckDigits = this.calculateCheckDigits(countryCode, accountPart);
    
    return checkDigits === calculatedCheckDigits;
  }

  /**
   * Generates random digits of specified length
   */
  private generateRandomDigits(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  }

  /**
   * Calculates check digits using MOD-97 algorithm (similar to IBAN)
   */
  private calculateCheckDigits(countryCode: string, accountNumber: string): string {
    // Move country code and check digits placeholder to end
    const rearranged = `${accountNumber}SWB${countryCode}00`;
    
    // Replace letters with numbers (A=10, B=11, ..., Z=35)
    let numericString = '';
    for (const char of rearranged) {
      if (char >= 'A' && char <= 'Z') {
        numericString += (char.charCodeAt(0) - 55).toString();
      } else {
        numericString += char;
      }
    }

    // Calculate MOD 97
    const remainder = this.mod97(numericString);
    const checkDigits = 98 - remainder;

    // Return as 2-digit string with leading zero if needed
    return checkDigits.toString().padStart(2, '0');
  }

  /**
   * Calculates MOD 97 for large numbers (as strings)
   */
  private mod97(numericString: string): number {
    let remainder = 0;
    
    for (let i = 0; i < numericString.length; i++) {
      remainder = (remainder * 10 + parseInt(numericString[i])) % 97;
    }
    
    return remainder;
  }

  /**
   * Removes spaces from account number
   */
  cleanAccountNumber(accountNumber: string): string {
    return accountNumber.replace(/\s/g, '');
  }
}