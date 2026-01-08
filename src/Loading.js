export const LoadingScreen = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#ffffff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            overflow: 'hidden'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '25px',
                textAlign: 'center'
            }}>
                {/* Enhanced Spinner with multiple circles */}
                <div style={{
                    position: 'relative',
                    width: '80px',
                    height: '80px'
                }}>
                    <div style={{
                        position: 'absolute',
                        width: '80px',
                        height: '80px',
                        border: '6px solid #e8f5e8',
                        borderTop: '6px solid #5DC23E',
                        borderRadius: '50%',
                        animation: 'spin 1.2s linear infinite'
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        width: '60px',
                        height: '60px',
                        top: '10px',
                        left: '10px',
                        border: '4px solid transparent',
                        borderTop: '4px solid #7DD957',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite reverse'
                    }}></div>
                    <div style={{
                        position: 'absolute',
                        width: '40px',
                        height: '40px',
                        top: '20px',
                        left: '20px',
                        border: '3px solid transparent',
                        borderTop: '3px solid #5DC23E',
                        borderRadius: '50%',
                        animation: 'spin 1.5s linear infinite'
                    }}></div>
                </div>

                {/* Loading Text with Dots Animation */}
                <div style={{
                    color: '#5DC23E',
                    fontSize: '20px',
                    fontWeight: '600',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                    Loading<span style={{ animation: 'dots 1.5s infinite' }}>...</span>
                </div>

                {/* Optional: App description */}
                <p style={{
                    color: '#666',
                    fontSize: '14px',
                    margin: 0,
                    opacity: 0.7
                }}>
                    Please wait while we prepare your experience
                </p>
            </div>

            {/* CSS Animations */}
            <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes dots {
            0%, 20% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
          }
        `}</style>
        </div>
    );
};