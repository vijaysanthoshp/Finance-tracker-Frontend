// Simple Dashboard Component for browser testing
const Dashboard = () => {
    return React.createElement('div', { 
        style: { 
            padding: '24px', 
            fontFamily: 'Roboto, sans-serif',
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
        } 
    }, [
        React.createElement('h1', { 
            key: 'title',
            style: { 
                color: '#2196f3', 
                marginBottom: '24px',
                fontSize: '2rem',
                fontWeight: '500'
            } 
        }, '💰 Finance Tracker Dashboard'),
        
        React.createElement('div', {
            key: 'cards',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
            }
        }, [
            // Balance Card
            React.createElement('div', {
                key: 'balance',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0'
                }
            }, [
                React.createElement('h3', { 
                    key: 'balance-title',
                    style: { margin: '0 0 12px 0', color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' } 
                }, 'Total Balance'),
                React.createElement('div', { 
                    key: 'balance-amount',
                    style: { fontSize: '2.5rem', fontWeight: 'bold', color: '#4caf50', margin: '0' } 
                }, '$12,450.80'),
                React.createElement('div', { 
                    key: 'balance-change',
                    style: { fontSize: '0.9rem', color: '#4caf50', marginTop: '8px' } 
                }, '↗ +2.5% from last month')
            ]),

            // Income Card
            React.createElement('div', {
                key: 'income',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0'
                }
            }, [
                React.createElement('h3', { 
                    key: 'income-title',
                    style: { margin: '0 0 12px 0', color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' } 
                }, 'Monthly Income'),
                React.createElement('div', { 
                    key: 'income-amount',
                    style: { fontSize: '2.5rem', fontWeight: 'bold', color: '#2196f3', margin: '0' } 
                }, '$5,200.00'),
                React.createElement('div', { 
                    key: 'income-change',
                    style: { fontSize: '0.9rem', color: '#666', marginTop: '8px' } 
                }, 'Salary + Freelance')
            ]),

            // Expenses Card
            React.createElement('div', {
                key: 'expenses',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0'
                }
            }, [
                React.createElement('h3', { 
                    key: 'expenses-title',
                    style: { margin: '0 0 12px 0', color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' } 
                }, 'Monthly Expenses'),
                React.createElement('div', { 
                    key: 'expenses-amount',
                    style: { fontSize: '2.5rem', fontWeight: 'bold', color: '#f44336', margin: '0' } 
                }, '$3,180.45'),
                React.createElement('div', { 
                    key: 'expenses-change',
                    style: { fontSize: '0.9rem', color: '#f44336', marginTop: '8px' } 
                }, '↗ +8% from last month')
            ])
        ]),

        // Recent Transactions Section
        React.createElement('div', {
            key: 'transactions',
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0'
            }
        }, [
            React.createElement('h2', { 
                key: 'transactions-title',
                style: { 
                    margin: '0 0 24px 0', 
                    color: '#333',
                    fontSize: '1.5rem',
                    fontWeight: '500'
                } 
            }, '📋 Recent Transactions'),
            
            React.createElement('div', {
                key: 'transactions-list',
                style: { display: 'flex', flexDirection: 'column', gap: '16px' }
            }, [
                // Transaction 1
                React.createElement('div', {
                    key: 'trans1',
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                    }
                }, [
                    React.createElement('div', { key: 'trans1-info' }, [
                        React.createElement('div', { 
                            key: 'trans1-desc',
                            style: { fontWeight: '500', color: '#333', marginBottom: '4px' } 
                        }, '🛒 Grocery Store'),
                        React.createElement('div', { 
                            key: 'trans1-date',
                            style: { fontSize: '0.85rem', color: '#666' } 
                        }, 'Today, 2:30 PM')
                    ]),
                    React.createElement('div', { 
                        key: 'trans1-amount',
                        style: { fontWeight: 'bold', color: '#f44336' } 
                    }, '-$78.45')
                ]),

                // Transaction 2
                React.createElement('div', {
                    key: 'trans2',
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                    }
                }, [
                    React.createElement('div', { key: 'trans2-info' }, [
                        React.createElement('div', { 
                            key: 'trans2-desc',
                            style: { fontWeight: '500', color: '#333', marginBottom: '4px' } 
                        }, '💰 Salary Deposit'),
                        React.createElement('div', { 
                            key: 'trans2-date',
                            style: { fontSize: '0.85rem', color: '#666' } 
                        }, 'Yesterday, 9:00 AM')
                    ]),
                    React.createElement('div', { 
                        key: 'trans2-amount',
                        style: { fontWeight: 'bold', color: '#4caf50' } 
                    }, '+$2,500.00')
                ]),

                // Transaction 3
                React.createElement('div', {
                    key: 'trans3',
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                    }
                }, [
                    React.createElement('div', { key: 'trans3-info' }, [
                        React.createElement('div', { 
                            key: 'trans3-desc',
                            style: { fontWeight: '500', color: '#333', marginBottom: '4px' } 
                        }, '⚡ Electric Bill'),
                        React.createElement('div', { 
                            key: 'trans3-date',
                            style: { fontSize: '0.85rem', color: '#666' } 
                        }, '2 days ago, 10:15 AM')
                    ]),
                    React.createElement('div', { 
                        key: 'trans3-amount',
                        style: { fontWeight: 'bold', color: '#f44336' } 
                    }, '-$125.30')
                ])
            ])
        ]),

        // Quick Actions
        React.createElement('div', {
            key: 'actions',
            style: {
                marginTop: '32px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
            }
        }, [
            React.createElement('button', {
                key: 'add-income',
                style: {
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '16px 24px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                },
                onMouseOver: (e) => { e.target.style.backgroundColor = '#45a049'; },
                onMouseOut: (e) => { e.target.style.backgroundColor = '#4caf50'; }
            }, '💰 Add Income'),

            React.createElement('button', {
                key: 'add-expense',
                style: {
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '16px 24px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                },
                onMouseOver: (e) => { e.target.style.backgroundColor = '#da190b'; },
                onMouseOut: (e) => { e.target.style.backgroundColor = '#f44336'; }
            }, '💸 Add Expense'),

            React.createElement('button', {
                key: 'view-reports',
                style: {
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '16px 24px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                },
                onMouseOver: (e) => { e.target.style.backgroundColor = '#1976d2'; },
                onMouseOut: (e) => { e.target.style.backgroundColor = '#2196f3'; }
            }, '📊 View Reports')
        ])
    ]);
};

// Render the app
ReactDOM.render(React.createElement(Dashboard), document.getElementById('root'));