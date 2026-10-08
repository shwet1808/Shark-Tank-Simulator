import { Mail, MessageSquare, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 max-w-2xl mx-auto w-full">
      <div className="text-center mb-12 animate-in">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--color-text)] mb-4">
          Get in Touch
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Have feedback on the simulation or want to integrate our AI panel into your incubator program? Let us know.
        </p>
      </div>

      <div className="glass-card p-6 md:p-8 w-full animate-in stagger-1">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="label-text flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              Email Address
            </label>
            <input type="email" className="input-field" placeholder="founder@startup.com" />
          </div>

          <div>
            <label className="label-text flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" />
              Message
            </label>
            <textarea
              rows={5}
              className="input-field resize-y"
              placeholder="Tell us what you're building..."
            />
          </div>

          <button className="w-full flex justify-center items-center gap-2 glow-btn bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white py-3 rounded-lg font-semibold transition-colors duration-200">
            <Send className="w-4 h-4" />
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
