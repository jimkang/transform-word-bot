HOMEDIR = $(shell pwd)
USER = bot
GROUP = bot
PRIVUSER = root
SERVER = smidgeo
SSHCMD = ssh $(USER)@$(SERVER)
PRIVSSHCMD = ssh $(PRIVUSER)@$(SERVER)
APPDIR = /opt/transform-word-bot

pushall:
	make sync && PROJECTNAME=improvebot make update-remote && PROJECTNAME=magic-applier make update-remote && git push origin master

sync:
	rsync -a $(HOMEDIR) $(USER)@$(SERVER):/opt/ --exclude node_modules/ --exclude data/
	$(SSHCMD) "cd $(APPDIR) && npm install"

update-remote: sync restart-remote

restart-remote:
	$(PRIVSSHCMD) "service $(PROJECTNAME) restart"

stop:
	$(PRIVSSHCMD) "service $(PROJECTNAME) stop"

install-service:
	$(PRIVSSHCMD) "cp $(APPDIR)/$(PROJECTNAME).service /etc/systemd/system && \
	systemctl enable $(PROJECTNAME)"

check-status:
	$(SSHCMD) "systemctl status $(PROJECTNAME)"

check-log:
	$(SSHCMD) "journalctl -u $(PROJECTNAME)"

update-iscool:
        git pull origin master && \
                npm update --save iscool && \
                git commit -a -m"Updated iscool." && \
                make pushall

make-data-dir:
	$(SSHCMD) "mkdir -p $(APPDIR)/data"

test:
	node tests/ephemeral-reply-counter-tests.js
	node tests/get-rarest-word-tests.js
	node tests/do-not-pick-tests.js

followback:
	node followback.js

tweet-unprompted:
	node tweet-seance.js

lint:
	eslint .
