DIR = ../..
UP_CMD = docker-compose up -d
DOWN_CMD = docker-compose down --remove-orphans
NT_CREATE_CMD = docker network create

mdag-up:
	cd $(DIR)/mdag-migration && $(UP_CMD)
	cd $(DIR)/mdag-filescan && $(UP_CMD)
	cd $(DIR)/mdag-mail && $(UP_CMD)
	cd $(DIR)/mdag-collect && $(UP_CMD)
	cd $(DIR)/mdag-bg && $(UP_CMD)
	cd $(DIR)/mdag-agent && $(UP_CMD)
	cd $(DIR)/mdag-admin && $(UP_CMD)
	cd $(DIR)/mdag && $(UP_CMD)

mdag-down:
	cd $(DIR)/mdag-migration && $(DOWN_CMD)
	cd $(DIR)/mdag-filescan && $(DOWN_CMD)
	cd $(DIR)/mdag-mail && $(DOWN_CMD)
	cd $(DIR)/mdag-collect && $(DOWN_CMD)
	cd $(DIR)/mdag-bg && $(DOWN_CMD)
	cd $(DIR)/mdag-agent && $(DOWN_CMD)
	cd $(DIR)/mdag-admin && $(DOWN_CMD)
	cd $(DIR)/mdag && $(DOWN_CMD)

mdag-restart:
	@make mdag-down
	@make mdag-up

itag-up:
	cd $(DIR)/itag && $(UP_CMD)
	cd $(DIR)/itag-collect && $(UP_CMD)
	cd $(DIR)/itag-bg && $(UP_CMD)
	cd $(DIR)/itag-bg-go && $(UP_CMD)
	cd $(DIR)/itag-agent && $(UP_CMD)
	cd $(DIR)/itag-admin && $(UP_CMD)
	@make itag-run

itag-run:
	cd $(DIR)/itag && docker-compose exec node npm run dev

itag-down:
	cd $(DIR)/itag-collect && $(DOWN_CMD)
	cd $(DIR)/itag-bg && $(DOWN_CMD)
	cd $(DIR)/itag-bg-go && $(DOWN_CMD)
	cd $(DIR)/itag-agent && $(DOWN_CMD)
	cd $(DIR)/itag-admin && $(DOWN_CMD)
	cd $(DIR)/itag && $(DOWN_CMD)

itag-restart:
	@make itag-down
	@make itag-up

mdag-recreate-network:
	@make prune-network
	@make mdag-create-network

itag-recreate-network:
	@make prune-network
	@make itag-create-network

prune-network:
	docker network prune -f

mdag-create-network:
	$(NT_CREATE_CMD) mdag
	$(NT_CREATE_CMD) mdag_bg
	$(NT_CREATE_CMD) mdag_agent
	$(NT_CREATE_CMD) mdag_admin
	$(NT_CREATE_CMD) mdag_mail
	$(NT_CREATE_CMD) mdag_collect
	$(NT_CREATE_CMD) mdag_migration
	$(NT_CREATE_CMD) mdag_filescan

itag-create-network:
	$(NT_CREATE_CMD) itag
	$(NT_CREATE_CMD) itag_bg
	$(NT_CREATE_CMD) itag_bg_go
	$(NT_CREATE_CMD) itag_agent
	$(NT_CREATE_CMD) itag_admin
	$(NT_CREATE_CMD) itag_mail
	$(NT_CREATE_CMD) itag_collect
	$(NT_CREATE_CMD) itag_analysis
	$(NT_CREATE_CMD) itag_log_check

bridge:
	$(NT_CREATE_CMD) --driver bridge ${hash}