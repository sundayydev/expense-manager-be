import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiSuccessResponse } from '../common/decorators/api-response.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { AppResponse } from '../common/exceptions/app-response.exception';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryDto } from './dto/category.dto';
import { TransactionType } from '@prisma/client';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiResponse({ status: 401, description: 'Chưa xác thực hoặc token không hợp lệ.', type: AppResponse })
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo một danh mục chi tiêu/thu nhập mới' })
  @ResponseMessage('Tạo danh mục thành công')
  @ApiSuccessResponse(CategoryDto, { statusCode: 201, description: 'Tạo danh mục thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.', type: AppResponse })
  @ApiResponse({ status: 404, description: 'Danh mục cha không tồn tại.', type: AppResponse })
  async create(@CurrentUser() user: any, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(user.sub, createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các danh mục hệ thống và danh mục tự tạo của người dùng' })
  @ApiQuery({ name: 'type', enum: TransactionType, required: false, description: 'Lọc theo loại giao dịch (INCOME hoặc EXPENSE)' })
  @ApiQuery({ name: 'tree', type: Boolean, required: false, description: 'Trả về cấu trúc dạng cây phân cấp cha-con (true/false)' })
  @ResponseMessage('Lấy danh sách danh mục thành công')
  @ApiSuccessResponse(CategoryDto, { isArray: true, description: 'Lấy danh sách thành công.' })
  async findAll(
    @CurrentUser() user: any,
    @Query('type') type?: TransactionType,
    @Query('tree') tree?: string,
  ) {
    const isTree = tree === 'true';
    return this.categoryService.findAll(user.sub, type, isTree);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một danh mục theo ID' })
  @ResponseMessage('Lấy thông tin danh mục thành công')
  @ApiSuccessResponse(CategoryDto, { description: 'Lấy chi tiết danh mục thành công.' })
  @ApiResponse({ status: 404, description: 'Danh mục không tồn tại hoặc không có quyền truy cập.', type: AppResponse })
  async findOne(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật một danh mục do người dùng tự tạo' })
  @ResponseMessage('Cập nhật danh mục thành công')
  @ApiSuccessResponse(CategoryDto, { description: 'Cập nhật danh mục thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào hoặc logic phân cấp không hợp lệ.', type: AppResponse })
  @ApiResponse({ status: 403, description: 'Không thể chỉnh sửa danh mục mặc định của hệ thống.', type: AppResponse })
  @ApiResponse({ status: 404, description: 'Danh mục không tồn tại.', type: AppResponse })
  async update(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(user.sub, id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa một danh mục do người dùng tự tạo' })
  @ResponseMessage('Xóa danh mục thành công')
  @ApiResponse({ status: 200, description: 'Xóa danh mục thành công.', type: AppResponse })
  @ApiResponse({ status: 400, description: 'Danh mục đang được sử dụng, không thể xóa.', type: AppResponse })
  @ApiResponse({ status: 403, description: 'Không thể xóa danh mục mặc định của hệ thống.', type: AppResponse })
  @ApiResponse({ status: 404, description: 'Danh mục không tồn tại.', type: AppResponse })
  async remove(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.categoryService.remove(user.sub, id);
  }
}
