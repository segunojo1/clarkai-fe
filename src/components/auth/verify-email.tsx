interface VerifyEmailProps {
  email: string;
}

const VerifyEmail = ({ email }: VerifyEmailProps) => {
  return (
    <section>
      <h2 className="text-[29px]/[auto] text-[#737373] font-semibold mb-6">Verify your email</h2>
      <p className="text-[15px] font-medium">
        We've sent a confirmation link to <span className="text-[#FF3D00]">{email}</span>.
        Click it to activate your Clark account and start learning.
      </p>
      <div className="mt-8">
        <p className="text-sm text-gray-500">
          Didn't receive the email?{' '}
          <button 
            className="text-[#FF3D00] hover:underline"
            onClick={() => {
              alert('Resending verification email...');
            }}
          >
            Resend email
          </button>
        </p>
      </div>
    </section>
  );
};

export default VerifyEmail;