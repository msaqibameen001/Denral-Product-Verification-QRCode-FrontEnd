import React from 'react';
import { Button, Result, ConfigProvider } from 'antd';

const NotFoundPage = () => (
  <ConfigProvider
    theme={{
      token: {
        fontFamily: '"ABeeZee", sans-serif'
      }
    }}
  >
    <Result
      status="404"
      title="404"
      subTitle="Sorry, This Page is not Available Right Now."
      extra={<Button type="primary">Back Home</Button>}
    />
  </ConfigProvider>
);
export default NotFoundPage;
