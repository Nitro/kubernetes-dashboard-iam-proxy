
var config = {}
config.upstreamDashboard = {}
config.proxy = {}

config.upstreamDashboard.url = process.env.UPSTREAM_DASHBOARD_URL || ""
config.proxy.url = process.env.PROXY_URL || ""
config.proxy.port = process.env.PROXY_PORT || ""

config.logLevel = "debug"

module.exports = config
