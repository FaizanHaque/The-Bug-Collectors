import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { err: null, stack: null };
  }

  static getDerivedStateFromError(err) {
    return { err };
  }

  componentDidCatch(err, info) {
    this.setState({ stack: info?.componentStack || "" });
    console.error(err, info);
  }

  render() {
    if (this.state.err) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <pre className="error-boundary__msg">{String(this.state.err?.message || this.state.err)}</pre>
          {this.state.stack && (
            <pre className="error-boundary__msg" style={{ fontSize: "0.75rem", opacity: 0.85 }}>
              {this.state.stack}
            </pre>
          )}
          <p>
            Try <a href="#/">home</a>, <a href="#/blue">React blue bar</a>, <a href="#/test">health check</a>, or open{" "}
            <a href={`${import.meta.env.BASE_URL}blue-bar-test.html`}>static blue bar</a> (no React).
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
