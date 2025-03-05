<script setup lang="ts">
import { Plus, Edit, EyeOff, User, LogOut } from 'lucide-vue-next';

const { adminBarState, editUrl, newUrl, collectionLabel, collectionUrl, hideAdminBar, user, login, logout } =
	useAdminBar();

const form = ref({
	email: '',
	password: '',
});
</script>

<template>
	<div class="sticky top-0 bg-[var(--background-variant-color)] text-white z-[9999]">
		<Container class="w-full flex justify-between items-center py-2">
			<template v-if="user">
				<div class="flex items-center gap-2.5">
					<!-- <img :src="directusLogo" alt="Directus Logo" class="h-6" /> -->
					<NuxtLink :to="collectionUrl" class="font-mono" target="_blank">{{ adminBarState.collection }}</NuxtLink>
					<span class="font-mono">/</span>
					<span class="text-sm text-[#ddd]">{{ adminBarState.title }}</span>
				</div>
				<div class="flex gap-2.5">
					<BaseButton v-if="editUrl" id="edit-button" :url="editUrl" target="_blank" variant="default" size="sm">
						<Edit class="w-4 h-4" />
						Edit {{ collectionLabel }}
					</BaseButton>
					<BaseButton v-if="newUrl" id="new-button" :url="newUrl" target="_blank" size="sm">
						<Plus class="w-4 h-4" />
						New {{ collectionLabel }}
					</BaseButton>
					<BaseButton id="hide-admin-bar-button" size="sm" @click="() => hideAdminBar()">
						<EyeOff class="w-4 h-4" />
					</BaseButton>
					<BaseButton id="logout-button" size="sm" @click="logout">
						<LogOut class="w-4 h-4" />
					</BaseButton>
				</div>
			</template>
			<template v-else>
				<DropdownMenu>
					<DropdownMenuTrigger>
						<BaseButton id="login-button" size="sm">
							<User class="w-4 h-4" />
							Login to use the admin bar
						</BaseButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<div>
							<Input v-model="form.email" placeholder="Email" />
							<Input v-model="form.password" placeholder="Password" />
							<Button @click="login(form.email, form.password)">Login</Button>
						</div>
					</DropdownMenuContent>
				</DropdownMenu>
			</template>
		</Container>
	</div>
</template>
