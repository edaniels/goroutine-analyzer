## What?

This tool allows is intended to be used for analyzing stack dumps of goroutines - often helpful for finding leaks, race conditions, wasteful resource consumption, and generally getting an idea of what your program is doing in production.

Inspired by https://github.com/linuxerwang/goroutine-inspect

Here's a simple example of code you can use to generate a goroutine dump.
```go
// DumpAllGoroutines dumps all goroutine stacktraces to STDERR.
func DumpAllGoroutines() {
	buf := make([]byte, 1024)
	var stackLen int
	for {
		stackLen = runtime.Stack(buf, true)
		if stackLen < len(buf) {
			break
		}

		buf = make([]byte, len(buf)*2)
	}

	fmt.Fprintf(
		os.Stderr,
		"\n=== goroutine dump ===\n%s=== end of goroutine dump ===\n",
		buf[:stackLen],
	)
}

init(){
	sigShutdown := make(chan os.Signal, 1)
	signal.Notify(sigShutdown, syscall.SIGTERM, syscall.SIGINT)
	go func(){
		sigs := make(chan os.Signal, 1)
		signal.Notify(sigs, syscall.SIGQUIT)
		for {
			<-sigs
			DumpAllGoroutines()
		}
	}()
}
```

To trigger the dump, run `kill -SIGQUIT <pid>`.

## Running 

You can run this locally too.  In the project directory, run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Notes

I welcome any comments, suggestions, and contributions.
