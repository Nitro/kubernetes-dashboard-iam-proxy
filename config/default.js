
var config = {}
config.upstreamDashboard = {}
config.proxy = {}

config.upstreamDashboard.url = process.env.UPSTREAM_DASHBOARD_URL || 'http://localhost'
config.clusterName = process.env.CLUSTER_NAME || 'mycluster'
config.proxy.url = process.env.PROXY_URL || 'http://localhost'
config.proxy.port = process.env.PROXY_PORT || '8888'

config.logLevel = 'debug'

module.exports = config
