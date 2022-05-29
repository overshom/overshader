const env = import.meta.env;

export const IS_DEV_ENV = env.MODE === 'development';
export const IS_PROD_ENV = env.MODE === 'production';
