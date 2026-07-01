import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class AppResponse extends HttpException {
  @ApiProperty({ type: String, nullable: true, description: 'Loại lỗi' })
  readonly type: string | null;

  @ApiProperty({ type: String, nullable: true, description: 'Thông báo lỗi' })
  override readonly message: string;

  @ApiProperty({ type: Boolean, description: 'Kết quả thao tác (luôn là false đối với exception)' })
  readonly result: boolean;

  @ApiProperty({ type: Number, description: 'Mã trạng thái HTTP (int32)' })
  readonly statusCode: number;

  @ApiProperty({ type: String, nullable: true, description: 'Mã vết để debug/log' })
  readonly traceId: string | null;

  constructor(
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    message: string | null = null,
    type: string | null = null,
    traceId: string | null = null,
  ) {
    const responseBody = {
      type,
      message,
      result: false,
      statusCode,
      traceId,
    };
    super(responseBody, statusCode);
    this.type = type;
    this.message = message || '';
    this.result = false;
    this.statusCode = statusCode;
    this.traceId = traceId;
  }
}
