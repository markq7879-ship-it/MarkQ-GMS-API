FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY src/MarkQ.GMS.Domain/MarkQ.GMS.Domain.csproj src/MarkQ.GMS.Domain/
COPY src/MarkQ.GMS.Application/MarkQ.GMS.Application.csproj src/MarkQ.GMS.Application/
COPY src/MarkQ.GMS.Infrastructure/MarkQ.GMS.Infrastructure.csproj src/MarkQ.GMS.Infrastructure/
COPY src/MarkQ.GMS.API/MarkQ.GMS.API.csproj src/MarkQ.GMS.API/

RUN dotnet restore src/MarkQ.GMS.API/MarkQ.GMS.API.csproj

COPY src/ src/

RUN dotnet publish src/MarkQ.GMS.API/MarkQ.GMS.API.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ENV ASPNETCORE_HTTP_PORTS=10000
EXPOSE 10000

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "MarkQ.GMS.API.dll"]

