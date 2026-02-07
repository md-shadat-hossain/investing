const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { walletService } = require("../services");
const response = require("../config/response");

const getWallet = catchAsync(async (req, res) => {
  const wallet = await walletService.getWalletByUserId(req.user._id);
  res.status(httpStatus.OK).json(
    response({
      message: "Wallet retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: wallet,
    })
  );
});

const getWalletStats = catchAsync(async (req, res) => {
  const { timeRange } = req.query;
  const stats = await walletService.getWalletStats(req.user._id, timeRange);
  res.status(httpStatus.OK).json(
    response({
      message: "Wallet statistics retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: stats,
    })
  );
});

module.exports = {
  getWallet,
  getWalletStats,
};
