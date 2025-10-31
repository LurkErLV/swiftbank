import {
  Controller,
  Get,
  UseGuards,
  Request,
  Body,
  Post,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse,
  ApiBody 
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { TransactionDto } from './dto/transaction.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all transactions',
    description: 'Retrieves all transactions (incoming and outgoing) for the authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of transactions retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          userId: 1,
          accountNumber: 'SWBLV47BANK00001234567890',
          beneficiaryAccountNumber: 'SWBLV89BANK00009876543210',
          amount: 100.50,
          createdAt: '2025-10-27T10:00:00.000Z',
          updatedAt: '2025-10-27T10:00:00.000Z',
          type: 'outgoing',
          isOutgoing: true,
          isIncoming: false
        },
        {
          id: 2,
          userId: 5,
          accountNumber: 'SWBLV12BANK00001111111111',
          beneficiaryAccountNumber: 'SWBLV47BANK00001234567890',
          amount: 250.00,
          createdAt: '2025-10-28T14:30:00.000Z',
          updatedAt: '2025-10-28T14:30:00.000Z',
          type: 'incoming',
          isOutgoing: false,
          isIncoming: true
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing token' 
  })
  findAll(@Request() req) {
    return this.transactionsService.getAllTransactions(req.user);
  }

  @Get('/accounts')
  @ApiOperation({ 
    summary: 'Get user accounts',
    description: 'Retrieves all bank accounts for the authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of user accounts retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          userId: 1,
          accountNumber: 'SWBLV47BANK00001234567890',
          accountType: 'checking',
          balance: 1500.75,
          currency: 'EUR',
          createdAt: '2025-10-20T10:00:00.000Z',
          updatedAt: '2025-10-29T10:00:00.000Z'
        },
        {
          id: 2,
          userId: 1,
          accountNumber: 'SWBLV89BANK00009876543210',
          accountType: 'savings',
          balance: 5000.00,
          currency: 'EUR',
          createdAt: '2025-10-21T14:30:00.000Z',
          updatedAt: '2025-10-29T10:00:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing token' 
  })
  findAccounts(@Request() req) {
    return this.transactionsService.getUserAccounts(req.user);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create a new transaction',
    description: 'Creates a new transaction by transferring funds from one account to another'
  })
  @ApiBody({ 
    type: TransactionDto,
    description: 'Transaction details including account numbers and amount'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Transaction created successfully',
    schema: {
      example: {
        id: 3,
        userId: 1,
        accountNumber: 'SWBLV47BANK00001234567890',
        beneficiaryAccountNumber: 'SWBLV89BANK00009876543210',
        amount: 100.50,
        createdAt: '2025-10-29T10:00:00.000Z',
        updatedAt: '2025-10-29T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid input data or validation failed' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing token' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Account not found or Beneficiary account not found' 
  })
  @ApiResponse({ 
    status: 422, 
    description: 'Insufficient funds in the account' 
  })
  createTransaction(@Request() req, @Body() transactionDto: TransactionDto) {
    return this.transactionsService.createTransaction(transactionDto, req.user);
  }
}