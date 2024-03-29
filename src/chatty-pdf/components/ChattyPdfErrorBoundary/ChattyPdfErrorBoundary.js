import { Button, Result } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

class ChattyPdfErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    console.error(error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Result
          status="warning"
          title="Sorry, something went wrong."
          subTitle="We are looking into it."
          extra={
            <Link to="/">
              <Button type="primary">Go Home</Button>
            </Link>
          }
        />
      );
    }

    return this.props.children;
  }
}

export default ChattyPdfErrorBoundary;
