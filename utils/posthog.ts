import posthog from "https://esm.sh/posthog-js";

class PostHog {
    private static instance: PostHog;
    private posthog: typeof posthog;
    private isBrowser: boolean;

    private constructor() {
        this.isBrowser = typeof window !== 'undefined';
        if (this.isBrowser) {
        this.posthog = posthog.init('phc_5gydO0R1jD9EhapgH1WlppGzNQ5nICINe8Rp4ha11Zi',
            {
                api_host: 'https://us.i.posthog.com',
                    person_profiles: 'always'
                }
            )
        }
    }

    public static getInstance(): PostHog {
        if (!PostHog.instance) {
            PostHog.instance = new PostHog();
        }
        return PostHog.instance;
    }   

    public async track(event: string, properties?: Record<string, any>) {
        this.posthog.capture(event, properties);
    }

    public identify(distinctId: string, properties?: Record<string, any>) { 
        this.posthog.identify(distinctId, properties);
    }

    public set(properties: Record<string, any>) {
        this.posthog.set(properties);
    }
}

export default PostHog.getInstance();