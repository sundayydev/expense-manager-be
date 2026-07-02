import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, ApiCreatedResponse, getSchemaPath, ApiExtraModels } from '@nestjs/swagger';

export const ApiSuccessResponse = <TModel extends Type<any>>(
  model?: TModel | 'string' | 'number' | 'boolean',
  options?: { isArray?: boolean; description?: string; statusCode?: number },
) => {
  const statusCode = options?.statusCode || 200;
  const isCreated = statusCode === 201;

  const dataProperty: any = {};
  const extraModels: any[] = [];

  if (model) {
    if (typeof model === 'string') {
      if (options?.isArray) {
        dataProperty.type = 'array';
        dataProperty.items = { type: model };
      } else {
        dataProperty.type = model;
      }
    } else {
      extraModels.push(ApiExtraModels(model));
      if (options?.isArray) {
        dataProperty.type = 'array';
        dataProperty.items = { $ref: getSchemaPath(model) };
      } else {
        dataProperty.$ref = getSchemaPath(model);
      }
    }
  } else {
    dataProperty.type = 'object';
    dataProperty.nullable = true;
    dataProperty.default = null;
  }

  const schema = {
    properties: {
      type: { type: 'string', example: 'Success' },
      message: { type: 'string', example: 'Thao tác thành công' },
      result: { type: 'boolean', example: true },
      statusCode: { type: 'number', example: statusCode },
      traceId: { type: 'string', example: 'd3b07384-d113-4ec8-a57f-d02d0cf3b123', nullable: true },
      data: dataProperty,
    },
  };

  const responseDecorator = isCreated
    ? ApiCreatedResponse({ description: options?.description, schema })
    : ApiOkResponse({ description: options?.description, schema });

  return applyDecorators(...extraModels, responseDecorator);
};
