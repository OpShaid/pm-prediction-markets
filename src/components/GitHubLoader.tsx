export function GitHubLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-6">
      {/* GitHub Mona-style animated loader */}
      <div className="relative">
        {/* Main octocat silhouette */}
        <div className="relative w-16 h-16">
          {/* Head */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-10 bg-gradient-to-b from-gray-600 to-gray-700 rounded-t-full animate-[bounce_1s_ease-in-out_infinite]" />

          {/* Ears */}
          <div className="absolute top-0 left-2 w-3 h-4 bg-gray-600 rounded-full animate-[bounce_1s_ease-in-out_infinite_0.1s]" />
          <div className="absolute top-0 right-2 w-3 h-4 bg-gray-600 rounded-full animate-[bounce_1s_ease-in-out_infinite_0.1s]" />

          {/* Body */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-10 h-8 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-lg animate-[bounce_1s_ease-in-out_infinite_0.2s]" />

          {/* Arms */}
          <div className="absolute top-9 left-1 w-3 h-6 bg-gray-700 rounded-full animate-[wiggle_1s_ease-in-out_infinite]" />
          <div className="absolute top-9 right-1 w-3 h-6 bg-gray-700 rounded-full animate-[wiggle_1s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }} />

          {/* Pulsing glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/20 to-gray-700/20 blur-xl animate-pulse" />
        </div>

        {/* Rotating dots around */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-500 rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-500 rounded-full" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-500 rounded-full" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-500 rounded-full" />
        </div>
      </div>

      {/* Loading text */}
      {text && <p className="text-muted-foreground text-sm animate-pulse">{text}</p>}
    </div>
  )
}
