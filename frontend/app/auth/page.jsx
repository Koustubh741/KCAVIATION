'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './page.module.css'

export default function AuthPage() {
    const router = useRouter()
    const [isLogin, setIsLogin] = useState(true)
    const [isAnimating, setIsAnimating] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        role: 'analyst'
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleToggle = () => {
        setIsAnimating(true)
        setTimeout(() => {
            setIsLogin(!isLogin)
            setError('')
            setFormData({
                email: '',
                password: '',
                confirmPassword: '',
                name: '',
                role: 'analyst'
            })
            setIsAnimating(false)
        }, 300)
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Validation
        if (!formData.email || !formData.password) {
            setError('Please fill in all required fields')
            setLoading(false)
            return
        }

        if (!isLogin) {
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match')
                setLoading(false)
                return
            }
            if (!formData.name) {
                setError('Please enter your name')
                setLoading(false)
                return
            }
        }

        try {
            // Simulated auth - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Store user session (mock)
            localStorage.setItem('user', JSON.stringify({
                email: formData.email,
                name: formData.name || 'User',
                role: formData.role,
                isAuthenticated: true
            }))

            router.push('/dashboard')
        } catch (err) {
            setError('Authentication failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.authPage}>
            {/* Background Effects */}
            <div className={styles.backgroundEffects}>
                <div className={styles.gradientOrb1}></div>
                <div className={styles.gradientOrb2}></div>
                <div className={styles.gridPattern}></div>
            </div>

            {/* Logo */}
            <div className={styles.logoSection}>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>✈️</span>
                    <div className={styles.logoText}>
                        <span className={styles.logoTitle}>AeroIntel</span>
                        <span className={styles.logoSubtitle}>Aviation Intelligence Platform</span>
                    </div>
                </div>
            </div>

            {/* Auth Container */}
            <div className={`${styles.authContainer} ${isAnimating ? styles.animating : ''}`}>
                <div className={styles.authCard}>
                    {/* Header */}
                    <div className={styles.authHeader}>
                        <h1 className={styles.authTitle}>
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className={styles.authSubtitle}>
                            {isLogin
                                ? 'Sign in to access market intelligence'
                                : 'Join the aviation intelligence platform'}
                        </p>
                    </div>

                    {/* Toggle */}
                    <div className={styles.toggle}>
                        <button
                            className={`${styles.toggleBtn} ${isLogin ? styles.active : ''}`}
                            onClick={() => !isLogin && handleToggle()}
                        >
                            Sign In
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${!isLogin ? styles.active : ''}`}
                            onClick={() => isLogin && handleToggle()}
                        >
                            Sign Up
                        </button>
                        <div
                            className={styles.toggleIndicator}
                            style={{ transform: isLogin ? 'translateX(0)' : 'translateX(100%)' }}
                        />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {!isLogin && (
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Full Name</label>
                                <div className={styles.inputWrapper}>
                                    <span className={styles.inputIcon}>👤</span>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Email Address</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>✉️</span>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Password</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>🔒</span>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Confirm Password</label>
                                    <div className={styles.inputWrapper}>
                                        <span className={styles.inputIcon}>🔒</span>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="Confirm your password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={styles.input}
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Role</label>
                                    <div className={styles.inputWrapper}>
                                        <span className={styles.inputIcon}>💼</span>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className={styles.select}
                                        >
                                            <option value="analyst">Market Analyst</option>
                                            <option value="manager">Intelligence Manager</option>
                                            <option value="executive">Executive Leadership</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        {isLogin && (
                            <div className={styles.forgotPassword}>
                                <a href="#">Forgot Password?</a>
                            </div>
                        )}

                        {error && (
                            <div className={styles.error}>
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className={styles.loader}></span>
                            ) : (
                                isLogin ? 'Sign In' : 'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className={styles.divider}>
                        <span>or continue with</span>
                    </div>

                    {/* Social Login */}
                    <div className={styles.socialLogin}>
                        <button className={styles.socialBtn}>
                            <span>🔷</span> Microsoft
                        </button>
                        <button className={styles.socialBtn}>
                            <span>🔶</span> Google
                        </button>
                    </div>
                </div>

                {/* Features Panel */}
                <div className={styles.featuresPanel}>
                    <h2 className={styles.featuresTitle}>Aviation Intelligence</h2>
                    <div className={styles.featuresList}>
                        <div className={styles.featureItem}>
                            <span className={styles.featureIcon}>🎤</span>
                            <div>
                                <h4>Voice Intelligence</h4>
                                <p>Record & analyze market signals with AI</p>
                            </div>
                        </div>
                        <div className={styles.featureItem}>
                            <span className={styles.featureIcon}>📊</span>
                            <div>
                                <h4>Real-time Analytics</h4>
                                <p>Airline-wise signals & trend analysis</p>
                            </div>
                        </div>
                        <div className={styles.featureItem}>
                            <span className={styles.featureIcon}>🔮</span>
                            <div>
                                <h4>Predictive Insights</h4>
                                <p>AI-powered forecasts & risk warnings</p>
                            </div>
                        </div>
                        <div className={styles.featureItem}>
                            <span className={styles.featureIcon}>🗺️</span>
                            <div>
                                <h4>Market Heatmaps</h4>
                                <p>Visual intelligence dashboards</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
