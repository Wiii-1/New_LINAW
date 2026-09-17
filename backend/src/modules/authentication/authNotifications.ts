export interface PasswordResetNotificationInput {
    email: string
    resetLink: string
}

export interface AuthNotifier {
    sendPasswordResetEmail(input: PasswordResetNotificationInput): Promise<void>
}

export class NoopAuthNotifier implements AuthNotifier {
    async sendPasswordResetEmail(): Promise<void> {
        return
    }
}