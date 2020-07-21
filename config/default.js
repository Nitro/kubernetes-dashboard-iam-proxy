
var config = {}
config.upstreamDashboard = {}
config.proxy = {}

config.upstreamDashboard.url = process.env.UPSTREAM_DASHBOARD_URL || ""
config.clusterName = process.env.CLUSTER_NAME || ""
config.proxy.url = process.env.PROXY_URL || ""
config.proxy.port = process.env.PROXY_PORT || ""

config.logLevel = "debug"

module.exports = config
