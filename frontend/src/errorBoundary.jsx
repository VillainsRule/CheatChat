import React from 'react';
import Error from '@components/Error';

export class ErrorBoundary extends React.Component {
    state = { error: '' };

    constructor(props) {
        super(props);
    };

    static getDerivedStateFromError(error) {
        return { error };
    };

    componentDidCatch(error, errorInfo) {
        this.setState({ error });
        console.error(error, errorInfo);
    };

    render() {
        if (this.state.error !== '') return (<Error header='render error' message={'something happened internally with our code! if you reload & this box is still here, contact developers.'} />);
        return this.props.children;
    };
};