const handler = async (event: FaasHandlerEvent, ctx: FaasHandlerContext) => {
  ctx.status(200).succeed(JSON.stringify(event.body, null, 2))
}

export = handler
