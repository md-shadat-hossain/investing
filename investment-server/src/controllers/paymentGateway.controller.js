const httpStatus = require("http-status");
const pick = require("../utils/pick");
const catchAsync = require("../utils/catchAsync");
const { paymentGatewayService } = require("../services");
const response = require("../config/response");
const ApiError = require("../utils/ApiError");

// Admin: Create gateway
const createGateway = catchAsync(async (req, res) => {
  const gateway = await paymentGatewayService.createGateway(req.body);
  res.status(httpStatus.CREATED).json(
    response({
      message: "Payment gateway created successfully",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: gateway,
    })
  );
});

// Get active gateways (for users)
const getActiveGateways = catchAsync(async (req, res) => {
  const { purpose } = req.query;
  const gateways = await paymentGatewayService.getActiveGateways(purpose);
  res.status(httpStatus.OK).json(
    response({
      message: "Payment gateways retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: gateways,
    })
  );
});

// Admin: Get all gateways
const getAllGateways = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["type", "isActive"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await paymentGatewayService.queryGateways(filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: "All payment gateways retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

// Get gateway by id
const getGateway = catchAsync(async (req, res) => {
  const gateway = await paymentGatewayService.getGatewayById(req.params.gatewayId);
  if (!gateway) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment gateway not found");
  }
  res.status(httpStatus.OK).json(
    response({
      message: "Payment gateway retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: gateway,
    })
  );
});

// Admin: Update gateway
const updateGateway = catchAsync(async (req, res) => {
  const gateway = await paymentGatewayService.updateGatewayById(req.params.gatewayId, req.body);
  res.status(httpStatus.OK).json(
    response({
      message: "Payment gateway updated successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: gateway,
    })
  );
});

// Admin: Delete gateway
const deleteGateway = catchAsync(async (req, res) => {
  await paymentGatewayService.deleteGatewayById(req.params.gatewayId);
  res.status(httpStatus.OK).json(
    response({
      message: "Payment gateway deleted successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {},
    })
  );
});

// Admin: Toggle gateway status
const toggleGatewayStatus = catchAsync(async (req, res) => {
  const gateway = await paymentGatewayService.toggleGatewayStatus(req.params.gatewayId);
  res.status(httpStatus.OK).json(
    response({
      message: "Payment gateway status toggled successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: gateway,
    })
  );
});

// Get gateways by type
const getGatewaysByType = catchAsync(async (req, res) => {
  const { type } = req.params;
  const gateways = await paymentGatewayService.getGatewaysByType(type);
  res.status(httpStatus.OK).json(
    response({
      message: "Payment gateways retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: gateways,
    })
  );
});

module.exports = {
  createGateway,
  getActiveGateways,
  getAllGateways,
  getGateway,
  updateGateway,
  deleteGateway,
  toggleGatewayStatus,
  getGatewaysByType,
};
