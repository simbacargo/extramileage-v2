from channels.generic.websocket import AsyncWebsocketConsumer


def group_name(slug):
    return f"auction_{slug}"


class AuctionConsumer(AsyncWebsocketConsumer):
    """Pushes live bid-panel updates to everyone watching an auction."""

    async def connect(self):
        self.slug = self.scope["url_route"]["kwargs"]["slug"]
        self.group = group_name(self.slug)
        await self.channel_layer.group_add(self.group, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group, self.channel_name)

    # event type "bid.update" -> this handler
    async def bid_update(self, event):
        await self.send(text_data=event["html"])
