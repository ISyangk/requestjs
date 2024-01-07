export const disconf = {
    dev: {
        HOST_URL: JSON.stringify(`//admin.dev.shupeitong.com`),
        LOGIN_URL: JSON.stringify('//super.dev.shupeitong.com'),
        GATEWAY_URL: JSON.stringify('//www.dev.shupeitong.com'),
        TRAIN_URL: JSON.stringify('//www.dev.shupeitong.com/train'),
        LEAF_URL: JSON.stringify('//leaf.dev.shupeitong.com'),
        APP_KEY: JSON.stringify('studyadmin'),
        APP_SECRET: JSON.stringify('123456'),
        LOG_APP_KEY: JSON.stringify('egohdzsbvhuwpb6m'), // 登录接口配置
        LOG_APP_SECRET: JSON.stringify('ZDcgQExDYS2kbueZYPQJHi/oYDNKMqERAOiUYa5qRgg='), // 登录接口配置
        OSS_BUCKET: JSON.stringify('saas-zhiyong'), // 获取阿里云token配置
        OSS_DIR: JSON.stringify(''), // 获取阿里云token配置
        ENV: JSON.stringify('dev'),
    },
    test: {
        HOST_URL: JSON.stringify(`//admin.test.shupeitong.com`),
        LOGIN_URL: JSON.stringify('//super.test.shupeitong.com'),
        GATEWAY_URL: JSON.stringify('//www.test.shupeitong.com'),
        TRAIN_URL: JSON.stringify('//www.test.shupeitong.com/train'),
        LEAF_URL: JSON.stringify('//leaf.test.shupeitong.com'),
        APP_KEY: JSON.stringify('studyadmin'),
        APP_SECRET: JSON.stringify('123456'),
        LOG_APP_KEY: JSON.stringify('egohdzsbvhuwpb6m'), // 登录接口配置
        LOG_APP_SECRET: JSON.stringify('ZDcgQExDYS2kbueZYPQJHi/oYDNKMqERAOiUYa5qRgg='), // 登录接口配置
        OSS_BUCKET: JSON.stringify('saas-zhiyong'), // 获取阿里云token配置
        OSS_DIR: JSON.stringify(''), // 获取阿里云token配置
        ENV: JSON.stringify('test'),
    },
    stage: {
        HOST_URL: JSON.stringify(`//admin.stage.shupeitong.com`),
        LOGIN_URL: JSON.stringify('//super.stage.shupeitong.com'),
        GATEWAY_URL: JSON.stringify('//www.stage.shupeitong.com'),
        TRAIN_URL: JSON.stringify('//www.stage.shupeitong.com/train'),
        LEAF_URL: JSON.stringify('//leaf.stage.shupeitong.com'),
        APP_KEY: JSON.stringify('studyadmin'),
        APP_SECRET: JSON.stringify('123456'),
        LOG_APP_KEY: JSON.stringify('egohdzsbvhuwpb6m'), // 登录接口配置
        LOG_APP_SECRET: JSON.stringify('ZDcgQExDYS2kbueZYPQJHi/oYDNKMqERAOiUYa5qRgg='), // 登录接口配置
        OSS_BUCKET: JSON.stringify('saas-stage'), // 获取阿里云token配置
        OSS_DIR: JSON.stringify(''), // 获取阿里云token配置
        ENV: JSON.stringify('stage'),
    },
    prod: {
        HOST_URL: JSON.stringify(`https://admin.shupeitong.com`),
        LOGIN_URL: JSON.stringify('https://super.shupeitong.com'),
        GATEWAY_URL: JSON.stringify('https://www.shupeitong.com'),
        TRAIN_URL: JSON.stringify('https://www.shupeitong.com/train'),
        LEAF_URL: JSON.stringify('https://leaf.shupeitong.com'),
        APP_KEY: JSON.stringify('8706c4b998'),
        APP_SECRET: JSON.stringify('7031301dd2f549308e625bfea6b5d6d1'),
        LOG_APP_KEY: JSON.stringify('egohdzsbvhuwpb6m'), // 登录接口配置
        LOG_APP_SECRET: JSON.stringify('ZDcgQExDYS2kbueZYPQJHi/oYDNKMqERAOiUYa5qRgg='), // 登录接口配置
        OSS_BUCKET: JSON.stringify('saas-prod-a'), // 获取阿里云token配置
        OSS_DIR: JSON.stringify(''), // 获取阿里云token配置
        ENV: JSON.stringify('prod'),
    },
}