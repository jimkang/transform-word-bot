PROJECTNAME = magic-applier
HOMEDIR = $(shell pwd)
USER = bot
PRIVUSER = root
SERVER = smidgeo
SSHCMD = ssh $(USER)@$(SERVER)
PRIVSSHCMD = ssh $(PRIVUSER)@$(SERVER)
APPDIR = /opt/transform-word-bot

pushall: sync restart-remote
	git push origin master

sync:
	rsync -a $(HOMEDIR) $(USER)@$(SERVER):/opt/ --exclude node_modules/ --exclude data/
	$(SSHCMD) "cd $(APPDIR) && npm install"

update-remote: sync restart-remote

restart-remote:
	$(PRIVSSHCMD) "service $(PROJECTNAME) restart"

install-service:
	$(PRIVSSHCMD) "cp $(APPDIR)/$(PROJECTNAME).service /etc/systemd/system && \
	systemctl enable $(PROJECTNAME)"

check-status:
	$(SSHCMD) "systemctl status $(PROJECTNAME)"

check-log:
	$(SSHCMD) "journalctl -u $(PROJECTNAME)"

make-data-dir:
	$(SSHCMD) "mkdir -p $(APPDIR)/data"

test:
	node tests/get-seance-topic-tests.js

followback:
	node followback.js

tweet-unprompted:
	node tweet-seance.js

lint:
	./node_modules/.bin/eslint .
