const express = require("express");
const config = require("../../config/config");
const authRoute = require("./auth.routes");
const userRoute = require("./user.routes");
const docsRoute = require("./docs.routes");
const walletRoute = require("./wallet.routes");
const investmentPlanRoute = require("./investmentPlan.routes");
const investmentRoute = require("./investment.routes");
const transactionRoute = require("./transaction.routes");
const referralRoute = require("./referral.routes");
const paymentGatewayRoute = require("./paymentGateway.routes");
const supportTicketRoute = require("./supportTicket.routes");
const notificationRoute = require("./notification.routes");
const adminRoute = require("./admin.routes");
const profitDistributionRoute = require("./profitDistribution.routes");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/users",
    route: userRoute,
  },
  {
    path: "/wallet",
    route: walletRoute,
  },
  {
    path: "/plans",
    route: investmentPlanRoute,
  },
  {
    path: "/investments",
    route: investmentRoute,
  },
  {
    path: "/transactions",
    route: transactionRoute,
  },
  {
    path: "/referrals",
    route: referralRoute,
  },
  {
    path: "/gateways",
    route: paymentGatewayRoute,
  },
  {
    path: "/tickets",
    route: supportTicketRoute,
  },
  {
    path: "/notifications",
    route: notificationRoute,
  },
  {
    path: "/admin",
    route: adminRoute,
  },
  {
    path: "/profits",
    route: profitDistributionRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: "/docs",
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
