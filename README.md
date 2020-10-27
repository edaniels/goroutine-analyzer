## What?

This project is intended to be used for analyzing 
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

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

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

