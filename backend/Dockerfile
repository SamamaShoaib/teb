FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@10.17.1 --activate

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm --filter @workspace/backend build

FROM base
COPY --from=build /usr/src/app/backend /app
COPY --from=build /usr/src/app/packages /packages
WORKDIR /app
EXPOSE 8080
CMD [ "pnpm", "start" ]
