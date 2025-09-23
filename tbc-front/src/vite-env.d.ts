interface ServerConfig {
  port: number;
  proxy: {
    [key: string]: string;
  };
}

const server: ServerConfig = {
  port: 5173,
  proxy: {
    '/payments': 'http://localhost:8080',
    '/api': 'http://localhost:8080',
    '/dev': 'http://localhost:8080'
  }
};