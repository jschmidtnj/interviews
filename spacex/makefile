# build / zip
all:
	go build
zip:
	zip -r joshua_schmidt_starlink_beam_planning.zip core/ enums/ \
		types/ utils/ main.go go.mod go.sum makefile README.md .gitignore
clean:
	rm -f *.zip && go clean
