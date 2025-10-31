import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { TransactionDto } from './dto/transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'generated/prisma';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async getAllTransactions(user: User) {
    // Get user's account numbers
    const userAccounts = await this.prisma.bankAccount.findMany({
      where: {
        userId: user.id,
      },
      select: {
        accountNumber: true,
      },
    });

    const accountNumbers = userAccounts.map(account => account.accountNumber);

    // Get all transactions where user is sender OR receiver
    const transactions = await this.prisma.transaction.findMany({
      where: {
        OR: [
          {
            // Outgoing transactions (user is sender)
            accountNumber: {
              in: accountNumbers,
            },
          },
          {
            // Incoming transactions (user is receiver)
            beneficiaryAccountNumber: {
              in: accountNumbers,
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Add transaction type to each transaction
    return transactions.map(transaction => ({
      ...transaction,
      type: accountNumbers.includes(transaction.accountNumber) ? 'outgoing' : 'incoming',
      isOutgoing: accountNumbers.includes(transaction.accountNumber),
      isIncoming: accountNumbers.includes(transaction.beneficiaryAccountNumber),
    }));
  }

  async getUserAccounts(user: User) {
    return await this.prisma.bankAccount.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createTransaction(transactionDto: TransactionDto, user: User) {
    // Find source account
    const account = await this.prisma.bankAccount.findUnique({
      where: {
        accountNumber: transactionDto.accountNumber,
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Check if account belongs to user
    if (account.userId !== user.id) {
      throw new UnprocessableEntityException('You do not have access to this account');
    }

    // Check sufficient funds
    if (account.balance < transactionDto.amount) {
      throw new UnprocessableEntityException('Insufficient funds');
    }

    // Find beneficiary account
    const beneficiaryAccount = await this.prisma.bankAccount.findUnique({
      where: {
        accountNumber: transactionDto.beneficiaryAccountNumber,
      },
    });

    if (!beneficiaryAccount) {
      throw new NotFoundException('Beneficiary account not found');
    }

    // Prevent transfer to same account
    if (transactionDto.accountNumber === transactionDto.beneficiaryAccountNumber) {
      throw new UnprocessableEntityException('Cannot transfer to the same account');
    }

    // Use Prisma transaction to ensure atomicity
    return await this.prisma.$transaction(async (prisma) => {
      // Deduct from source account
      await prisma.bankAccount.update({
        where: {
          accountNumber: transactionDto.accountNumber,
        },
        data: {
          balance: {
            decrement: transactionDto.amount,
          },
        },
      });

      // Add to beneficiary account
      await prisma.bankAccount.update({
        where: {
          accountNumber: transactionDto.beneficiaryAccountNumber,
        },
        data: {
          balance: {
            increment: transactionDto.amount,
          },
        },
      });

      // Create transaction record
      return await prisma.transaction.create({
        data: {
          userId: user.id,
          accountNumber: transactionDto.accountNumber,
          amount: transactionDto.amount,
          beneficiaryAccountNumber: transactionDto.beneficiaryAccountNumber,
        },
      });
    });
  }
}